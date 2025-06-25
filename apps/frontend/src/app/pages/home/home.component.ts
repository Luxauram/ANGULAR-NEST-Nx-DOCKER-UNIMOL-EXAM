import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Post } from '../../models/post.model';
import { PostListComponent } from '../../features/posts/components/post-list/post-list.component';
import { SocialService } from '../../services/user/social.service';
import { FeedService } from '../../services/post/feed.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PostListComponent, RouterModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  feedPosts: Post[] = [];
  isLoading = false;
  followingCount = 0;
  currentUserId: string | null = null;
  debugInfo: any = {};

  constructor(
    private feedService: FeedService,
    private socialService: SocialService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.getCurrentUserId();
    console.log('🚀 Home component initialized');
    console.log('👤 Current user ID:', this.currentUserId);

    this.debugFullFeedFlow();

    this.loadSocialStats();
    this.loadPersonalizedFeed();
  }

  /**
   * Carica le statistiche sociali dell'utente con debug completo
   */
  private loadSocialStats(): void {
    if (!this.currentUserId) {
      console.log('⚠️ No current user ID, skipping social stats');
      return;
    }

    console.log('📊 Loading social stats...');

    // Carica il conteggio degli utenti seguiti
    this.socialService.getMyFollowing(100, 0).subscribe({
      next: (following) => {
        console.log('👥 Raw following response:', following);
        console.log('👥 Following type:', typeof following);
        console.log('👥 Following keys:', Object.keys(following || {}));

        // Debug: stampa ogni utente seguito
        let followedUsers: any[] = [];

        if (following && following.data && Array.isArray(following.data)) {
          followedUsers = following.data;
          this.followingCount = following.data.length;
        } else if (following && Array.isArray(following)) {
          followedUsers = following;
          this.followingCount = following.length;
        }

        console.log('📋 Followed users details:');
        followedUsers.forEach((user, index) => {
          console.log(`  ${index + 1}. User:`, {
            id: user.id,
            userId: user.userId,
            targetUserId: user.targetUserId,
            username: user.username,
            email: user.email,
            full: user,
          });
        });

        console.log(`✅ Following ${this.followingCount} users`);

        // Salva per debug
        this.debugInfo.following = followedUsers;
        this.debugInfo.followingCount = this.followingCount;
      },
      error: (error) => {
        console.error('❌ Error loading following count:', error);
        this.debugInfo.followingError = error;
      },
    });
  }

  /**
   * Carica il feed personalizzato con debug completo
   */
  private loadPersonalizedFeed(): void {
    if (!this.currentUserId) {
      console.log('⚠️ No current user ID, cannot load personalized feed');
      this.isLoading = false;
      return;
    }

    console.log('📰 Loading personalized feed...');
    this.isLoading = true;

    // PROVA PRIMA IL BACKEND FEED
    this.feedService.getFeedAsPosts().subscribe({
      next: (posts) => {
        console.log('✅ Feed loaded successfully:', posts);
        console.log('📊 Feed stats:', {
          totalPosts: posts.length,
          postIds: posts.map((p) => p.id),
          authors: posts.map((p) => ({ id: p.userId, username: p.username })),
        });

        this.feedPosts = posts;
        this.isLoading = false;
        this.debugInfo.feedPosts = posts;
        this.debugInfo.feedSuccess = true;
      },
      error: (error) => {
        console.error('❌ Error loading personalized feed:', error);
        this.debugInfo.feedError = error;
        this.isLoading = false;

        // FALLBACK: prova a caricare direttamente dal backend
        this.tryBackendFeedDirectly();
      },
    });
  }

  /**
   * Prova a chiamare direttamente l'endpoint del backend feed
   */
  private tryBackendFeedDirectly(): void {
    console.log('🔄 Trying backend feed directly...');

    this.feedService.getFeed(1, 20).subscribe({
      next: (userFeed) => {
        console.log('📦 Backend feed response:', userFeed);

        // Converte UserFeed in Post[]
        const posts = this.feedService.convertUserFeedToPosts(userFeed);
        console.log('🔄 Converted posts:', posts);

        this.feedPosts = posts;
        this.debugInfo.backendFeedSuccess = true;
        this.debugInfo.backendFeed = userFeed;
      },
      error: (error) => {
        console.error('❌ Backend feed also failed:', error);
        this.debugInfo.backendFeedError = error;

        // ULTIMO FALLBACK: recent posts
        this.loadRecentPostsAsFallback();
      },
    });
  }

  /**
   * Carica i post recenti come fallback
   */
  private loadRecentPostsAsFallback(): void {
    console.log('🆘 Loading recent posts as fallback...');

    this.feedService.getRecentAsPosts(1, 10).subscribe({
      next: (posts) => {
        console.log('📰 Recent posts loaded as fallback:', posts);
        this.feedPosts = posts;
        this.debugInfo.fallbackSuccess = true;
        this.debugInfo.fallbackPosts = posts;
      },
      error: (error) => {
        console.error('❌ Even fallback failed:', error);
        this.debugInfo.fallbackError = error;
        this.feedPosts = [];
      },
    });
  }

  /**
   * Ricarica il feed personalizzato
   */
  refreshFeed(): void {
    console.log('🔄 Refreshing feed...');

    // Prima forza il refresh del feed sul backend
    this.feedService.refreshFeed().subscribe({
      next: () => {
        console.log('✅ Feed refresh requested on backend');
        // Aspetta un po' prima di ricaricare
        setTimeout(() => {
          this.loadPersonalizedFeed();
        }, 1000);
      },
      error: (error) => {
        console.error('❌ Error refreshing feed on backend:', error);
        // Ricarica comunque il feed
        this.loadPersonalizedFeed();
      },
    });
  }

  /**
   * Gestisce la creazione di un nuovo post
   */
  onPostCreated(post: Post): void {
    console.log('✨ New post created:', post);
    this.feedPosts.unshift(post);
  }

  /**
   * Ottiene l'ID dell'utente corrente
   */
  private getCurrentUserId(): string | null {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id || null;
  }

  /**
   * Metodo per debug - stampa tutte le informazioni
   */
  logDebugInfo(): void {
    console.log('🐛 COMPLETE DEBUG INFO:');
    console.log('📊 Component state:', {
      currentUserId: this.currentUserId,
      followingCount: this.followingCount,
      feedPostsCount: this.feedPosts.length,
      isLoading: this.isLoading,
    });
    console.log('🔍 Debug info:', this.debugInfo);
  }

  debugFullFeedFlow(): void {
    console.log('🔍 === FULL FEED DEBUG START ===');

    // 1. Verifica autenticazione
    const currentUser = this.authService.getCurrentUser();
    console.log('👤 Current user:', currentUser);

    // 2. Verifica chi stai seguendo
    this.socialService.getMyFollowing(100, 0).subscribe({
      next: (following) => {
        console.log('👥 Following from frontend:', following);

        // 3. Prova il feed service direttamente
        this.feedService.getFeed(1, 20).subscribe({
          next: (feed) => {
            console.log('📰 Feed from backend:', feed);
          },
          error: (error) => {
            console.error('❌ Feed error:', error);

            // 4. Prova il refresh del feed
            this.feedService.refreshFeed().subscribe({
              next: () => {
                console.log('✅ Feed refresh completed');

                // 5. Riprova il feed dopo il refresh
                setTimeout(() => {
                  this.feedService.getFeed(1, 20).subscribe({
                    next: (refreshedFeed) => {
                      console.log('🔄 Refreshed feed:', refreshedFeed);
                    },
                    error: (refreshError) => {
                      console.error('❌ Refreshed feed error:', refreshError);
                    },
                  });
                }, 2000);
              },
              error: (refreshError) => {
                console.error('❌ Refresh error:', refreshError);
              },
            });
          },
        });
      },
      error: (error) => {
        console.error('❌ Following error:', error);
      },
    });

    console.log('🔍 === FULL FEED DEBUG END ===');
  }
}

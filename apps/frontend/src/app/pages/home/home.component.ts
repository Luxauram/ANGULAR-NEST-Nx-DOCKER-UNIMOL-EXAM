import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../models/post.model';
import { PostListComponent } from '../../features/posts/components/post-list/post-list.component';
import { SocialService } from '../../services/user/social.service';
import { FeedService } from '../../services/post/feed.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PostListComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  feedPosts: Post[] = [];
  isLoading = false;
  followingCount = 0;
  debugInfo: any = null;

  constructor(
    private feedService: FeedService,
    private socialService: SocialService
  ) {}

  ngOnInit(): void {
    // this.loadSocialStats();
    // this.loadFeed();

    this.loadRecentAsFeed();
  }

  loadRecentAsFeed(): void {
    this.isLoading = true;

    this.feedService.getRecentAsPosts().subscribe({
      next: (posts) => {
        this.feedPosts = posts;
        this.isLoading = false;
        console.log('Loaded recent posts:', posts.length);
      },
      error: (error) => {
        console.error('Error loading recent posts:', error);
        this.isLoading = false;
      },
    });
  }

  // Carica le statistiche sociali per verificare i follow
  loadSocialStats(): void {
    // Assumendo che tu abbia un metodo per ottenere l'ID dell'utente corrente
    // Se non ce l'hai, dovrai implementarlo nel tuo AuthService
    const currentUserId = this.getCurrentUserId(); // Implementa questo metodo

    if (currentUserId) {
      this.socialService.getSocialStats(currentUserId).subscribe({
        next: (stats) => {
          // Gestisci il caso in cui SocialStats potrebbe avere proprietà diverse
          console.log('Social stats received:', stats);

          // Prova diverse possibili proprietà che potrebbero esistere
          this.followingCount =
            (stats as any).followingCount ||
            (stats as any).following ||
            (stats as any).followingTotal ||
            0;
        },
        error: (error) => {
          console.error('Error loading social stats:', error);
        },
      });

      // Carica anche la lista dei following per debug
      this.socialService.getMyFollowing(10, 0).subscribe({
        next: (following) => {
          console.log('Users you follow:', following);
          this.debugInfo = following;

          // Se le stats non funzionano, conta manualmente
          if (following && following.data && Array.isArray(following.data)) {
            this.followingCount = following.data.length;
          } else if (following && Array.isArray(following)) {
            this.followingCount = following.length;
          }
        },
        error: (error) => {
          console.error('Error loading following:', error);
        },
      });
    } else {
      // Se non riesci a ottenere l'ID utente, prova comunque a caricare i following
      this.socialService.getMyFollowing(10, 0).subscribe({
        next: (following) => {
          console.log('Users you follow (without user ID):', following);
          this.debugInfo = following;

          // Conta i following
          if (following && following.data && Array.isArray(following.data)) {
            this.followingCount = following.data.length;
          } else if (following && Array.isArray(following)) {
            this.followingCount = following.length;
          }
        },
        error: (error) => {
          console.error('Error loading following:', error);
        },
      });
    }
  }

  loadFeed(): void {
    this.isLoading = true;

    console.log('Loading feed...');

    // Debug: prova anche a caricare i post recenti per confronto
    this.feedService.getRecentAsPosts(1, 5).subscribe({
      next: (recentPosts) => {
        console.log('Recent posts (for comparison):', recentPosts);
      },
      error: (error) => {
        console.error('Error loading recent posts:', error);
      },
    });

    // Carica il feed personalizzato
    this.feedService.getFeedAsPosts().subscribe({
      next: (posts) => {
        console.log('Feed posts received:', posts);
        this.feedPosts = posts;
        this.isLoading = false;

        if (posts.length === 0 && this.followingCount > 0) {
          console.warn(
            'No posts in feed despite following users. Check backend feed algorithm.'
          );
        }
      },
      error: (error) => {
        console.error('Error loading feed:', error);
        this.isLoading = false;

        // Fallback: carica i post recenti se il feed fallisce
        this.loadRecentPostsAsFallback();
      },
    });
  }

  // Metodo di fallback che carica i post recenti
  loadRecentPostsAsFallback(): void {
    console.log('Loading recent posts as fallback...');
    this.feedService.getRecentAsPosts().subscribe({
      next: (posts) => {
        this.feedPosts = posts;
        console.log('Loaded recent posts as fallback:', posts);
      },
      error: (error) => {
        console.error('Error loading fallback posts:', error);
      },
    });
  }

  refreshFeed(): void {
    this.feedService.refreshFeed().subscribe({
      next: () => {
        console.log('Feed refresh requested');
        this.loadFeed();
      },
      error: (error) => {
        console.error('Error refreshing feed:', error);
      },
    });
  }

  onPostCreated(post: Post): void {
    this.feedPosts.unshift(post);
  }

  // Implementa questo metodo per ottenere l'ID dell'utente corrente
  private getCurrentUserId(): string | null {
    // Questa implementazione dipende da come gestisci l'autenticazione
    // Potresti avere bisogno di:
    // return this.authService.getCurrentUserId();
    // oppure estrarlo dal token JWT
    return null; // Sostituisci con la tua implementazione
  }

  // Metodo per testare diversi tipi di feed
  testDifferentFeeds(): void {
    console.log('=== TESTING DIFFERENT FEED TYPES ===');

    // Test trending
    this.feedService.getTrendingAsPosts(5).subscribe({
      next: (posts) => console.log('Trending posts:', posts),
      error: (error) => console.error('Trending error:', error),
    });

    // Test timeline
    this.feedService.getTimelineAsPosts(1, 5).subscribe({
      next: (posts) => console.log('Timeline posts:', posts),
      error: (error) => console.error('Timeline error:', error),
    });

    // Test recent
    this.feedService.getRecentAsPosts(1, 5).subscribe({
      next: (posts) => console.log('Recent posts:', posts),
      error: (error) => console.error('Recent error:', error),
    });
  }
}

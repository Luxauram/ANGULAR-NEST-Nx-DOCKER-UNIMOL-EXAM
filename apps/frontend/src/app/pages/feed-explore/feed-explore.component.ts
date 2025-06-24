import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FollowDto } from '../../models/social.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth/auth.service';
import { SocialService } from '../../services/user/social.service';
import { UserService } from '../../services/user/user.service';

export interface DiscoverUser {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  mutualFollowsCount?: number;
  commonTags?: string[];
  lastActiveAt?: Date;
}

@Component({
  selector: 'app-feed-explore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feed-explore.component.html',
  styleUrls: ['./feed-explore.component.css'],
})
export class FeedExploreComponent implements OnInit {
  users: DiscoverUser[] = [];
  isLoading = false;
  error: string | null = null;
  currentUserId: string | null = null;

  // Filtri per la discovery
  filters = {
    limit: 12,
    shuffle: true,
    excludeFollowing: true,
  };

  constructor(
    private userService: UserService,
    private socialService: SocialService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.getCurrentUserId();
    this.loadDiscoverUsers();
  }

  /**
   * Carica utenti per la discovery
   */
  loadDiscoverUsers(): void {
    this.isLoading = true;
    this.error = null;

    // Usa i follow suggestions se disponibili, altrimenti fallback
    this.socialService.getFollowSuggestions(this.filters.limit).subscribe({
      next: (users) => {
        console.log('🔍 Follow suggestions loaded:', users);
        this.processDiscoverUsers(users);
        this.isLoading = false;
      },
      error: (error) => {
        console.warn(
          '⚠️ Follow suggestions not available, falling back to search'
        );
        // Fallback: cerca tutti gli utenti tramite search vuota o altri metodi
        this.loadUsersAsFallback();
      },
    });
  }

  /**
   * Fallback: carica utenti usando i metodi disponibili nel UserService
   */
  private loadUsersAsFallback(): void {
    // Dato che UserService non ha getAllUsers(), usiamo searchUsers con query vuota
    // o implementiamo una logica alternativa
    this.userService.searchUsers('').subscribe({
      next: (users) => {
        console.log('📝 Users loaded for discovery:', users);

        // Filtra l'utente corrente
        let filteredUsers = users.filter(
          (user) => user.id !== this.currentUserId
        );

        // Randomizza l'ordine
        filteredUsers = this.shuffleArray(filteredUsers);

        // Limita il numero
        filteredUsers = filteredUsers.slice(0, this.filters.limit);

        this.processDiscoverUsers(filteredUsers);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading users for discovery:', error);
        this.error = 'Unable to load users for discovery';
        this.isLoading = false;
      },
    });
  }

  /**
   * Processa gli utenti per la discovery aggiungendo informazioni extra
   */
  private processDiscoverUsers(users: User[]): void {
    const processedUsers: DiscoverUser[] = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.username, // Usa username come displayName
      bio: user.bio || `Hello! I'm ${user.username}`,
      avatar: user.avatar,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isFollowing: false,
      mutualFollowsCount: 0,
      commonTags: [],
      lastActiveAt: new Date(), // Usa data corrente
    }));

    this.users = processedUsers;

    // Carica informazioni aggiuntive per ogni utente
    this.loadUsersAdditionalInfo();
  }

  /**
   * Carica informazioni aggiuntive per ogni utente (social stats, following status, etc.)
   */
  private loadUsersAdditionalInfo(): void {
    this.users.forEach((user, index) => {
      // Carica stats sociali
      this.socialService.getSocialStats(user.id).subscribe({
        next: (stats) => {
          this.users[index].followersCount = stats.followersCount || 0;
          this.users[index].followingCount = stats.followingCount || 0;
        },
        error: (error) => {
          console.warn(
            `Could not load social stats for user ${user.id}:`,
            error
          );
        },
      });

      // Verifica se già seguito usando getRelationship
      if (this.currentUserId) {
        this.socialService.getRelationship(user.id).subscribe({
          next: (relationship) => {
            this.users[index].isFollowing = relationship?.isFollowing || false;
          },
          error: (error) => {
            console.warn(
              `Could not check following status for user ${user.id}:`,
              error
            );
          },
        });
      }
    });
  }

  /**
   * Segue/smette di seguire un utente
   */
  toggleFollow(user: DiscoverUser): void {
    if (!this.currentUserId) {
      this.router.navigate(['/login']);
      return;
    }

    const isCurrentlyFollowing = user.isFollowing;

    if (isCurrentlyFollowing) {
      this.socialService.unfollowUser(user.id).subscribe({
        next: () => {
          user.isFollowing = false;
          user.followersCount = Math.max(0, (user.followersCount || 0) - 1);
          console.log(`✅ Unfollowed user: ${user.username}`);
        },
        error: (error) => {
          console.error('❌ Error unfollowing user:', error);
        },
      });
    } else {
      const followData: FollowDto = {
        targetUserId: user.id,
      };

      this.socialService.followUser(followData).subscribe({
        next: () => {
          user.isFollowing = true;
          user.followersCount = (user.followersCount || 0) + 1;
          console.log(`✅ Followed user: ${user.username}`);
        },
        error: (error) => {
          console.error('❌ Error following user:', error);
        },
      });
    }
  }

  /**
   * Naviga al profilo dell'utente
   */
  viewProfile(user: DiscoverUser): void {
    this.router.navigate(['/profile', user.id]);
  }

  /**
   * Ricarica la lista di utenti discovery
   */
  refreshDiscovery(): void {
    this.loadDiscoverUsers();
  }

  /**
   * Utility: randomizza un array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Ottiene l'ID dell'utente corrente
   */
  private getCurrentUserId(): string | null {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id || null;
  }

  /**
   * Formatta il numero di follower/following
   */
  formatCount(count: number | undefined): string {
    if (!count || count === 0) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + 'K';
    return (count / 1000000).toFixed(1) + 'M';
  }

  /**
   * Genera un avatar placeholder se non presente
   */
  getAvatarUrl(user: DiscoverUser): string {
    if (user.avatar) return user.avatar;
    // Genera un avatar placeholder colorato basato sull'username
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FECA57',
      '#FF9FF3',
      '#54A0FF',
    ];
    const colorIndex = user.username.charCodeAt(0) % colors.length;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.username
    )}&background=${colors[colorIndex].substring(
      1
    )}&color=fff&size=120&bold=true`;
  }

  /**
   * Filtra utenti per nome/username
   */
  searchUsers(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.loadDiscoverUsers();
      return;
    }

    const filtered = this.users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    this.users = filtered;
  }

  /**
   * TrackBy function per ottimizzare ngFor
   */
  trackByUserId(index: number, user: DiscoverUser): string {
    return user.id;
  }

  /**
   * Verifica se un utente è stato attivo di recente
   */
  isRecentlyActive(date: Date | undefined): boolean {
    if (!date) return false;
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24; // Attivo nelle ultime 24 ore
  }

  /**
   * Formatta la data per il tooltip
   */
  getFormattedDate(date: Date | undefined): string {
    if (!date) return 'Unknown';
    return date.toLocaleString();
  }
}

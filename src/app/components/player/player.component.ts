import { Component, OnDestroy, OnInit } from '@angular/core';
import { TitleSettings, VideoService } from '../../services/video.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [],
  templateUrl: './player.component.html',
})
export class PlayerComponent implements OnInit, OnDestroy {
  public currentVideo!: string;
  public currentTitle: string | null = null;
  public currentSettings!: TitleSettings;

  private videoSub!: Subscription;
  private titleSub!: Subscription;
  private settingsSub!: Subscription;

  constructor(private videoService: VideoService) {}

  ngOnInit() {
    this.videoSub = this.videoService.currentVideo.subscribe({
      next: (video) => {
        this.currentVideo = video;
        this.currentTitle = null;
        this.videoService.currentText.next(null);
      },
    });

    this.titleSub = this.videoService.currentText.subscribe({
      next: (text) => {
        this.currentTitle = text ? text : null;
      },
    });

    this.settingsSub = this.videoService.currentSettings.subscribe({
      next: (settings) => (this.currentSettings = settings),
    });
  }

  ngOnDestroy() {
    this.videoSub.unsubscribe();
    this.titleSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  onTimeUpdate(event: Event) {
    const video = event.target as HTMLVideoElement;
    this.videoService.currentTime.next(video.currentTime);
  }
}

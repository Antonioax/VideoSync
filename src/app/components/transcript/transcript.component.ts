import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Title, TitleService } from '../../services/title.service';
import { VideoService } from '../../services/video.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transcript',
  standalone: true,
  imports: [],
  templateUrl: './transcript.component.html',
})
export class TranscriptComponent implements OnInit, OnDestroy {
  transcript: Title[] = [];
  currentIndex: number | null = null;

  titleSub!: Subscription;
  timeSub!: Subscription;

  @ViewChild('transcriptContainer')
  transcriptContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private titleService: TitleService,
    private videoService: VideoService
  ) {}

  ngOnInit() {
    this.titleSub = this.videoService.currentTitle.subscribe({
      next: (title) => this.loadTitles('assets/titles/' + title),
    });

    this.timeSub = this.videoService.currentTime.subscribe({
      next: (currentTime) => this.updateTranscript(currentTime),
    });
  }

  ngOnDestroy() {
    this.titleSub.unsubscribe();
    this.timeSub.unsubscribe();
  }

  loadTitles(title: string) {
    this.titleService.loadTitle(title).subscribe({
      next: (titles) => {
        this.transcript = titles;
      },
      error: (err) => console.log(err),
    });
  }

  toDisplayTime(timestamp: string) {
    const [hours, minutes, secondsMili] = timestamp.split(':');
    const seconds = secondsMili.split(',')[0];

    const displayMinutes = parseInt(hours, 10) * 60 + parseInt(minutes);
    const displaySeconds = parseInt(seconds, 10);

    return (
      displayMinutes.toString().padStart(2, '0') +
      ':' +
      displaySeconds.toString().padStart(2, '0')
    );
  }

  updateTranscript(currentTime: number) {
    this.currentIndex = this.transcript.findIndex((title) =>
      this.doesExistTitle(title, currentTime)
    );
    this.scrollToCurrentSubtitle();

    if (this.currentIndex !== null) {
      this.videoService.currentText.next(
        this.transcript[this.currentIndex].text
      );
    } else {
      this.videoService.currentText.next(null);
    }
  }

  doesExistTitle(title: Title, currentTime: number) {
    const startTime = this.parseTime(title.start);
    const endTime = this.parseTime(title.end);

    return currentTime >= startTime && currentTime <= endTime;
  }

  parseTime(time: string) {
    const [hours, minutes, secondsMillis] = time.split(':');
    const [seconds, milliseconds] = secondsMillis.split(',').map(Number);

    const convertedTime =
      parseInt(hours, 10) * 3600 +
      parseInt(minutes, 10) * 60 +
      seconds +
      milliseconds / 1000;

    return convertedTime;
  }

  scrollToCurrentSubtitle() {
    if (this.currentIndex !== null && this.transcriptContainer) {
      const element = this.transcriptContainer.nativeElement.children[
        this.currentIndex
      ] as HTMLDivElement;
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
}

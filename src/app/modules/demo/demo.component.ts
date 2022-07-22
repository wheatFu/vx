import { Component, OnInit } from '@angular/core'
import { interval, Observable, of } from 'rxjs'
import { take, startWith } from 'rxjs/operators'

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.less'],
})
export class DemoComponent implements OnInit {
  counter = 0

  count$: Observable<number>

  get getter(): string {
    this.counter++

    return 'a'
  }

  ngOnInit(): void {
    this.count$ = interval(1000).pipe(startWith(-1), take(5))
  }
}

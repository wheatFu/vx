import { Component, OnInit } from '@angular/core'
import { Map } from 'immutable'

@Component({
  selector: 'app-ga',
  templateUrl: './ga.component.html',
  styleUrls: ['./ga.component.less'],
})
export class GaComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    this.test()
  }

  test = () => {
    const mapa = Map({
      select: 'users',
      filter: Map({ name: 'Cam' }),
    })

    const mapb = mapa.set('select', 'people')

    console.log(mapa === mapb) // false
    console.log(mapa.get('filter') === mapb.get('filter')) // true
  }
}

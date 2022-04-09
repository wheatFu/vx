import { Component, EventEmitter, Input, Output } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SearchInputComponent,
      multi: true,
    },
  ],
})
export class SearchInputComponent implements ControlValueAccessor {
  value: any

  @Input() placeholder = ''

  @Output() keyUp = new EventEmitter<void>()

  valueChange = value => {}

  @Input() get model() {
    return this.value
  }

  set model(value) {
    this.value = value
    this.valueChange(value)
  }

  writeValue(value: any): void {
    this.value = value
    this.valueChange(value)
  }

  registerOnChange(fn: any): void {
    this.valueChange = fn
  }

  registerOnTouched(fn: any): void {}

  setDisabledState?(isDisabled: boolean): void {}

  keyUpSearch(event) {
    if (event) {
      this.keyUp.emit()
    }
  }
}

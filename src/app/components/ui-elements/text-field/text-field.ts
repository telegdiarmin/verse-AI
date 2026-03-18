import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'vai-text-field',
  imports: [],
  templateUrl: './text-field.html',
  styleUrl: './text-field.css',
  providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextField),
    multi: true
  }
]
})
export class TextField implements ControlValueAccessor {
  protected onChange: (value: string) => void = () => {};
  
  protected onTouched: () => void = () => {};
  
  protected value: string = "";

  public readonly placeholder = input<string>('');

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
  }

  onInput(value: string) {
    this.value = value;
    this.onChange(value);
  }
}

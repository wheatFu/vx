import { Injectable } from '@angular/core'
import { FormControl, Validators, FormGroup } from '@angular/forms'
import { ValidFromService } from 'src/app/valid/valid-from.service'
import { BaseControl } from './form-base'

@Injectable()
export class BaseControlService {
  constructor(private validSrv: ValidFromService) {}
  toFormGroup(disabled: boolean, questions: BaseControl<any>[]) {
    const group: any = {}

    questions.forEach(question => {
      switch (question.key) {
        case 'idNo':
          group[question.key] = question.required
            ? new FormControl({ value: question.value || null, disabled }, [
                Validators.required,
                this.validSrv.idcardValid(),
              ])
            : new FormControl({ value: question.value || null, disabled }, [this.validSrv.idcardValid()])
          break

        case 'mobile':
          group[question.key] = question.required
            ? new FormControl({ value: question.value || null, disabled }, [
                Validators.required,
                this.validSrv.mobilePhoneValid(),
              ])
            : new FormControl({ value: question.value || null, disabled }, [this.validSrv.mobilePhoneValid()])
          break

        case 'email':
          group[question.key] = question.required
            ? new FormControl({ value: question.value || null, disabled }, [Validators.required, Validators.email])
            : new FormControl({ value: question.value || null, disabled }, [Validators.email])
          break
        default:
          group[question.key] = question.required
            ? new FormControl({ value: question.value || null, disabled }, [Validators.required])
            : new FormControl({ value: question.value || null, disabled }, [])
          break
      }
    })
    return new FormGroup(group)
  }
}

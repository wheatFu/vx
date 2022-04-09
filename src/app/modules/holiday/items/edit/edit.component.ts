import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
} from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NzMessageService } from 'ng-zorro-antd'
import { ActivatedRoute, Router } from '@angular/router'
const { hasOwnProperty } = Object.prototype
interface RuleOpts {
  year: string
  day: string
}
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditComponent implements OnInit {
  validateForm!: FormGroup
  isSupervisorOptions = [
    { label: '是', value: true },
    { label: '否', value: false },
  ]
  distributionWays = [
    { label: '按年发放', value: '1' },
    { label: '按月发放', value: '2' },
  ]
  quotaType = [
    { label: '额度控制', value: '1' },
    { label: '非额度控制', value: '2' },
  ]
  rulesByWorkTime: RuleOpts[] = []
  rulesByEntryCompanyTime: RuleOpts[] = []
  year: string
  day: string
  positionInfo: any
  isSelected: false
  selectedDistributionWay: string
  distributionTimeRadioValue = 'naturalYear'
  efficientRadioValue = 'naturalYear'
  workTimeChecked = false
  entryCompanyTimeChecked = false
  fixedDayNums = false
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private msg: NzMessageService,
    private router: Router,
    private elementRef: ElementRef,
    private changeDel: ChangeDetectorRef,
  ) {
    this.validateForm = this.fb.group({
      code: [null],
      name: [null],
      unit:[null],
      minUnit:[null],
      type:[null],
      description:[null],
      way:[null],
      distributionDate: [null],
      day: [null],
      employeeDate: [{ value: false }, Validators.required],
      distributionTime: [{ value: 'naturalYear' }],
      other: [null],
    })
  }

  ngOnInit() {}
  clear() {
    this.validateForm.patchValue({ organName: null })
  }
  savePosition() {}
  doCancel() {}

  clearSelected() {
    this.validateForm.patchValue({ superiorName: null })
  }
  selected() {}
  newAddRuleByWorkTime() {
    this.rulesByWorkTime.push({ year: '', day: '' })
    if(this.rulesByWorkTime.length > 0){
      this.workTimeChecked = true
    }
  }
  newAddRuleByEntryCompanyTime(){
    this.rulesByEntryCompanyTime.push({ year: '', day: '' })
    if(this.rulesByEntryCompanyTime.length > 0){
      this.entryCompanyTimeChecked = true
    }
  }
  deleteWorkTimeRule(index: number) {
    this.rulesByWorkTime.splice.call(this.rulesByWorkTime, index, 1)
    if(this.rulesByWorkTime.length === 0){
      this.workTimeChecked = false
    }
  }
  deleteEntryCompanyTimeRule(index?: number){
    this.rulesByEntryCompanyTime.splice.call(this.rulesByEntryCompanyTime, index, 1)
    if(this.rulesByEntryCompanyTime.length === 0){
      this.entryCompanyTimeChecked = false
    }
  }
  handleChange(isChecked:boolean){
      if(!isChecked){
        this.rulesByWorkTime = []
      }
  }
  modelChange(val) {
    this.selectedDistributionWay = val
  }
}

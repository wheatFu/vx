import { Component, OnInit } from '@angular/core';
import test,{ attrDecorate,methodDecorate,EventEmitter } from './utils'
@Component({
  selector: 'app-dictionaries',
  templateUrl: './dictionaries.component.html',
  styleUrls: ['./dictionaries.component.less']
})
export class DictionariesComponent implements OnInit {
  @attrDecorate('araaaa') username = 'jack'
  constructor() { }
  // 方法装饰器
  @methodDecorate('确定删除吗？')
  del(flag?:boolean){
    console.log('delete ok',flag);
    test()
  }
  ngOnInit() {
  }

}

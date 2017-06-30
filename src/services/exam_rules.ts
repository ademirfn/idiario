import { Observable } from 'rxjs/Observable'
import { ConnectionService } from './connection'
import { ServerService } from './server'
import { Http, Response } from '@angular/http'
import { Storage } from '@ionic/storage'
import { Injectable } from '@angular/core'
import 'rxjs/Rx'

@Injectable()
export class ExamRulesService {
  constructor(
    private http: Http,
    private storage: Storage,
    private connection: ConnectionService,
    private server: ServerService
  ){}

  getExamRules(teacherId: number, classroomId: number){

    if(this.connection.isOnline){
      return this.getOnlineExamRules(teacherId, classroomId)
    }else{
      return this.getOfflineExamRules(classroomId)
    }

  }
  private getOnlineExamRules(teacherId: number, classroomId: number){
    const request = this.http.get(this.server.getExamRulesUrl(), { params: { teacher_id: teacherId, classroom_id: classroomId } } )
    return request.map((response: Response) => {
      return {
        data: response.json(),
        classroomId: classroomId
      }
    })
  }

  getOfflineExamRules(classroomId: number){
    return new Observable((observer) => {
      this.storage.get('examRules').then((examRules) => {
        examRules.forEach((examRule) => {
          if(examRule.classroomId == classroomId){
            observer.next(examRule)
            observer.complete()
          }
        })
      })
    })
  }
}
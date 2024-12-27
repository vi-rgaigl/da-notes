import { inject, Injectable } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { collection, collectionData, doc, addDoc, onSnapshot, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];

  firestore: Firestore = inject(Firestore);

  unsubNote;
  unsubTrash;

  constructor() { 
    this.unsubNote = this.subNoteList();
    this.unsubTrash = this.subTrashList();
  }

  async addNote(item: Note) {  //addDoc ist ein Promise
    await addDoc(this.getNotesRef(), item)
    .catch((err) => { console.log(err); })
    .then((docRef) => { console.log('Doc added with ID: ', docRef?.id); });
  }

  ngOnDestroy() {
    this.unsubNote();
    this.unsubTrash();
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      list.forEach(item => {
        this.trashNotes.push(this.setNoteObject(item.data(), item.id));
      });
    });
  }

  subNoteList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      list.forEach(item => {
        this.normalNotes.push(this.setNoteObject(item.data(), item.id));
      });
    });
  }


  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || 'note',
      title: obj.title || '',
      content: obj.content  || '',
      marked: obj.marked || false,
    };
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}

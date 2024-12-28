import { inject, Injectable } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { collection, query, orderBy, limit, where, doc, addDoc, updateDoc, deleteDoc, onSnapshot, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  markedNotes: Note[] = [];

  firestore: Firestore = inject(Firestore);

  unsubNote;
  unsubTrash;
  unsubMarked;

  constructor() { 
    this.unsubNote = this.subNoteList();
    this.unsubTrash = this.subTrashList();
    this.unsubMarked = this.subNoteListMarked();
  }

  async addNote(item: Note, colId: 'notes' | 'trash') {  //addDoc ist ein Promise
    if( colId === 'notes') { 
      await addDoc(this.getNotesRef(), item)
      .catch((err) => { console.log(err); });
    }
    else if (colId === 'trash') {
      await addDoc(this.getTrashRef(), item)
      .catch((err) => { console.log(err); });
    }
    // .then((docRef) => { console.log('Doc added with ID: ', docRef?.id); });
  }

  async updateNote(item: Note) {
    if(item.id) {
      let colRef = this.getSingleDocRef(this.getColIdFromNoteType(item), item.id);
      await updateDoc(colRef, this.getCleanJson(item))
      .catch((err) => { console.log(err); })
      // .then(() => { console.log('Doc updated with ID: ', item.id); });
    }
  }
  
  async deleteNote(colId: 'notes' | 'trash', docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId))
    .catch((err) => { console.log(err); })
    // .then(() => { console.log('Doc deleted with ID: ', docId); });
  }

  getColIdFromNoteType(note: Note) {
    return note.type === 'note' ? 'notes' : 'trash';
  }

  getCleanJson(note: Note) {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    };

  }

  ngOnDestroy() {
    this.unsubNote();
    this.unsubTrash();
    this.unsubMarked();
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(item => {
        this.trashNotes.push(this.setNoteObject(item.data(), item.id));
      });
    });
  }

  subNoteList() {
    const q = query(this.getNotesRef(), orderBy('title'), limit(10));  //where('title', '==', 'Note 1') -> geht nicht mit orderby('title'); orderBy unterscheidet Groß- und Kleinschreibung
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(item => {
        this.normalNotes.push(this.setNoteObject(item.data(), item.id));
      });
      list.docChanges().forEach((change) => {  //interssant für die Anzeige von Änderungen
        if (change.type === "added") {
            console.log("New note: ", change.doc.data());
        }
        if (change.type === "modified") {
            console.log("Modified note: ", change.doc.data());
        }
        if (change.type === "removed") {
            console.log("Removed note: ", change.doc.data());
        }
      },
      (err: any) => { console.log(err); }); //weil kein Promise, sollte der Error abgefangen werden
    });
  }

  subNoteListMarked() {
    const q = query(this.getNotesRef(), where('marked', '==', true), limit(10)); 
    return onSnapshot(q, (list) => {
      this.markedNotes = [];
      list.forEach(item => {
        this.markedNotes.push(this.setNoteObject(item.data(), item.id));
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

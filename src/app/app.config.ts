import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    importProvidersFrom(provideFirebaseApp(() => initializeApp(
      {"projectId":"danotes-a1f2b",
        "appId":"1:521458819979:web:fa4fdfebfd5ad525b4c58e",
        "storageBucket":"danotes-a1f2b.firebasestorage.app",
        "apiKey":"AIzaSyDYse5fG5mq4jSq_Rf2VRXnkew2nni7TLU",
        "authDomain":"danotes-a1f2b.firebaseapp.com",
        "messagingSenderId":"521458819979"
      }))), 
    importProvidersFrom(provideFirestore(() => getFirestore()))]
};

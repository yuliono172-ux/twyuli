/// <reference types="vite/client" />

declare module 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js' {
  export function initializeApp(config: any): any;
  export function getApps(): any[];
  export function getApp(): any;
}

declare module 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js' {
  export function getDatabase(app?: any): any;
  export function ref(db: any, path?: string): any;
  export function set(ref: any, value: any): Promise<void>;
  export function get(ref: any): Promise<any>;
  export function onValue(ref: any, callback: (snapshot: any) => void, cancelCallback?: (error: any) => void): () => void;
  export function off(ref: any): void;
  export function update(ref: any, values: any): Promise<void>;
  export function remove(ref: any): Promise<void>;
}

declare module 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js' {
  interface FirebaseUser {
    uid: string;
    email?: string | null;
    displayName?: string | null;
  }

  export function getAuth(app?: any): any;
  export function onAuthStateChanged(
    auth: any,
    callback: (user: FirebaseUser | null) => void
  ): () => void;
  export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function signOut(auth: any): Promise<void>;
}

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDiuf-oaHGRLERMTF4sNMW-PNRRx3DN-g",
  authDomain: "test-82a9b.firebaseapp.com",
  projectId: "test-82a9b",
  storageBucket: "test-82a9b.appspot.com",
  messagingSenderId: "243136097779",
  appId: "1:243136097779:web:e040266cc16bcaf1ca7686",
  measurementId: "G-G896TC2ZHY"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Firestore & Auth
const db = firebase.firestore();
const auth = firebase.auth();

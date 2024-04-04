import { db } from "../../firebase-config";
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { Component } from 'react';

export async function reportError(errorStr) {
    // Use a simplified version of the error string as a document ID
    const errorId = errorStr.substring(0, 50).replace(/\W/g, '_');
    const errorDocRef = doc(db, "errorLog", errorId);
  
    // Try to get the document
    const docSnap = await getDoc(errorDocRef);
  
    if (docSnap.exists()) {
      // If document exists, increment the count
      await updateDoc(errorDocRef, {
        count: docSnap.data().count + 1
      });
    } else {
      // If it doesn't exist, create a new document with count set to 1
      await setDoc(errorDocRef, {
        errorStr: errorStr,
        count: 1,
        timestamp: new Date()
      });
    }
  }

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    reportError(error + " " + errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;

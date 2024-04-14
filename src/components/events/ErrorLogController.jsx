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
    // Include error details in the initial state
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    reportError(error + " " + errorInfo);
    console.log(error + " " + errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Customized UI when rendering error information
      return (
          <div>
            <h1>Something went wrong.</h1>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {/* Safely access componentStack, checking if errorInfo is not null */}
              {this.state.errorInfo ? this.state.errorInfo.componentStack : 'No stack trace available'}
            </details>
          </div>
      );
    }

    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;

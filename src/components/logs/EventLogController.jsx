export async function logEvent(type, author, before, after) {
    if (type !== "account" || type !== "journal" || type !== "account")
    return;

let uniqueId = -1;
const errorDocRef = doc(db, "eventLog", "idCounter");

// Try to get the document
const docSnap = await getDoc(errorDocRef);

if (docSnap.exists()) {
    uniqueId = docSnap.data().count;
  // If document exists, increment the count
  await updateDoc(errorDocRef, {
    count: docSnap.data().count + 1
  });


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
}
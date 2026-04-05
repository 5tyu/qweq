// functions/index.js — Firebase Cloud Functions
// Deploy via: firebase deploy --only functions
//
// Prerequisites:
//   npm install -g firebase-tools
//   firebase init functions   (choose Node 18)
//   cd functions && npm install

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

/**
 * adminCreateUser — Callable function that allows an admin to create
 * a new Firebase Auth account + Firestore user document in one shot.
 *
 * Client call:
 *   const fn = httpsCallable(functions, 'adminCreateUser');
 *   await fn({ email, password, name, role, supervisorId });
 */
exports.adminCreateUser = onCall(async (request) => {
  // 1. Auth guard — caller must be signed in
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  // 2. Role guard — caller must be an admin
  const callerDoc = await getFirestore()
    .collection("users")
    .doc(request.auth.uid)
    .get();

  if (!callerDoc.exists || callerDoc.data().role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can create users.");
  }

  const { email, password, name, role = "agent", supervisorId = null } =
    request.data;

  // 3. Basic validation
  if (!email || !password || !name) {
    throw new HttpsError("invalid-argument", "email, password, and name are required.");
  }
  if (password.length < 6) {
    throw new HttpsError("invalid-argument", "Password must be at least 6 characters.");
  }
  if (!["agent", "supervisor", "admin"].includes(role)) {
    throw new HttpsError("invalid-argument", "Invalid role.");
  }

  // 4. Create Firebase Auth account
  let userRecord;
  try {
    userRecord = await getAuth().createUser({ email, password, displayName: name });
  } catch (err) {
    throw new HttpsError("already-exists", err.message);
  }

  // 5. Write Firestore user document
  await getFirestore().collection("users").doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    name,
    role,
    supervisorId,
    status: "active",
    disabled: false,
    createdAt: new Date().toISOString(),
    theme: { primaryColor: "#fdc9c9", title: `${name}'s Counter` },
  });

  return { uid: userRecord.uid, message: `${role} "${name}" created successfully.` };
});

/**
 * adminDisableUser — Toggle disabled state of a Firebase Auth account.
 */
exports.adminDisableUser = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required.");

  const callerDoc = await getFirestore().collection("users").doc(request.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== "admin") {
    throw new HttpsError("permission-denied", "Admins only.");
  }

  const { targetUid, disabled } = request.data;
  if (!targetUid) throw new HttpsError("invalid-argument", "targetUid required.");

  await getAuth().updateUser(targetUid, { disabled: !!disabled });
  await getFirestore().collection("users").doc(targetUid).update({ disabled: !!disabled });

  return { message: `User ${disabled ? "disabled" : "enabled"}.` };
});

/**
 * adminDeleteUser — Permanently delete a Firebase Auth account + Firestore doc.
 */
exports.adminDeleteUser = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required.");

  const callerDoc = await getFirestore().collection("users").doc(request.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== "admin") {
    throw new HttpsError("permission-denied", "Admins only.");
  }

  const { targetUid } = request.data;
  if (!targetUid) throw new HttpsError("invalid-argument", "targetUid required.");
  if (targetUid === request.auth.uid) throw new HttpsError("invalid-argument", "Cannot delete yourself.");

  await getAuth().deleteUser(targetUid);
  // Optionally keep Firestore doc as audit trail — comment out to hard delete:
  // await getFirestore().collection("users").doc(targetUid).delete();

  return { message: "User deleted." };
});

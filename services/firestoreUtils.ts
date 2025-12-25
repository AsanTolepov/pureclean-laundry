// services/firestoreUtils.ts

// Firestore setDoc/updateDoc ga yuborishdan oldin
// obyekt ichidagi barcha undefined qiymatlarni chiqarib tashlaydi.
// Firestore undefined qiymatni qabul qilmaydi.
export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => cleanForFirestore(item)) as any;
  }

  if (typeof data === 'object') {
    const result: any = {};
    Object.entries(data as any).forEach(([key, value]) => {
      if (value === undefined) {
        // undefined fieldni umuman yozmaymiz
        return;
      }
      result[key] = cleanForFirestore(value);
    });
    return result;
  }

  return data;
}
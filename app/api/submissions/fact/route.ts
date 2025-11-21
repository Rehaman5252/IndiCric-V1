import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  console.log('📝 Fact submission API called');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { userId, content } = body;

    if (!userId || !content) {
      console.log('❌ Missing fields');
      return NextResponse.json(
        { success: false, error: 'Missing userId or content' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed, writing to Firestore...');
    console.log('DB instance:', db ? 'exists' : 'null');

    const docRef = await addDoc(collection(db!, 'submissions'), {
      type: 'fact',
      userId,
      content,
      status: 'under-verification',
      createdAt: serverTimestamp(),
    });

    console.log('✅ Document created with ID:', docRef.id);

    return NextResponse.json({ success: true, id: docRef.id }, { status: 201 });
  } catch (err) {
    console.error('❌ Error in fact submission:', err);
    return NextResponse.json(
      { 
        success: false, 
        error: err instanceof Error ? err.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

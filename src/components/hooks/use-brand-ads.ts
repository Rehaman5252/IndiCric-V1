'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from './use-toast';
import { mapFirestoreError } from '@/lib/utils';

export interface CubeBrand {
    id: string; // Document ID from Firestore
    brand: string;
    format: string;
    logoUrl: string;
    logoHint: string;
    description: string;
    order: number;
}

export const useBrandAds = () => {
    const [brands, setBrands] = useState<CubeBrand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!db) {
            setError("Database connection is not available.");
            setLoading(false);
            return;
        }

        const brandsCollection = collection(db, 'brands');
        const q = query(brandsCollection, orderBy('order', 'asc'));

        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const brandsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as CubeBrand));
                setBrands(brandsData);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching brands from Firestore:", err);
                const mappedError = mapFirestoreError(err);
                setError(mappedError.userMessage);
                toast.error("Failed to load quizzes", {
                    description: mappedError.userMessage
                });
                setLoading(false);
            }
        );

        // Cleanup the listener when the component unmounts
        return () => unsubscribe();
    }, [toast]);

    return { brands, loading, error };
};
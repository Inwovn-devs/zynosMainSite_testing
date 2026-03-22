import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { setUser, clearUser, setLoading, syncUser } from '../store/slices/authSlice';
import { fetchCart } from '../store/slices/cartSlice';
import { fetchWishlist } from '../store/slices/wishlistSlice';

export const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        dispatch(setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }));
        // syncUser sets loading=false when it completes (success or fail)
        dispatch(syncUser());
        dispatch(fetchCart());
        dispatch(fetchWishlist());
      } else {
        dispatch(clearUser()); // sets loading=false immediately
      }
    });
    return unsubscribe;
  }, [dispatch]);
};

export const useAuth = () => {
  return useSelector((state) => state.auth);
};

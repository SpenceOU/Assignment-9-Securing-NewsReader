import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ArticlesContext = createContext();

export function ArticlesProvider({ children }) {
  const { user } = useAuth();

  // Saved articles are organized by username so each user has their own list:
  // { spencer: [article, article], alex: [article] }
  const [savedArticlesByUser, setSavedArticlesByUser] = useState(() => {
    try {
      const saved = localStorage.getItem('savedArticlesByUser');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save to localStorage every time anyone's saved articles change
  useEffect(() => {
    localStorage.setItem('savedArticlesByUser', JSON.stringify(savedArticlesByUser));
  }, [savedArticlesByUser]);

  // The current user's saved articles (empty if nobody is logged in)
  const getUserSavedArticles = () => {
    if (!user) return [];
    return savedArticlesByUser[user.username] || [];
  };

  // Every user's saved articles (used by the admin page)
  const getAllUserArticles = () => savedArticlesByUser;

  // Returns false if nobody is logged in so the card can send them to /login
  const saveArticle = (article) => {
    if (!user) return false;
    setSavedArticlesByUser(prev => {
      const userArticles = prev[user.username] || [];
      if (userArticles.some(a => a.url === article.url)) {
        return prev;
      }
      return { ...prev, [user.username]: [...userArticles, article] };
    });
    return true;
  };

  const removeArticle = (url) => {
    if (!user) return;
    setSavedArticlesByUser(prev => ({
      ...prev,
      [user.username]: (prev[user.username] || []).filter(a => a.url !== url)
    }));
  };

  const isArticleSaved = (url) => {
    return getUserSavedArticles().some(a => a.url === url);
  };

  return (
    <ArticlesContext.Provider
      value={{
        savedArticlesByUser,
        saveArticle,
        removeArticle,
        isArticleSaved,
        getUserSavedArticles,
        getAllUserArticles
      }}
    >
      {children}
    </ArticlesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useArticles = () => {
  const context = useContext(ArticlesContext);
  if (!context) {
    throw new Error('useArticles must be used within ArticlesProvider');
  }
  return context;
};
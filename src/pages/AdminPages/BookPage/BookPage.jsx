import PropTypes from "prop-types";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBookById } from "../../../services/bookServices";
import { useEffect, useState } from "react";
import Loading from "../../../components/ui/Loading/Loading";
import { getCurrentUser, autoLogin } from "../../../services/userServices";
import styles from "./BookPage.module.css";

const BookPage = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getBookById(bookId)
      .then((res) => {
        setBook(res.data);
      })
      .catch((error) => {
        console.error("Error fetching book by id:", error);
      });
  }, [bookId]);

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      await tryAutologin();
    }
    await validateToken(token);
    setIsLoading(false);
  };

  const tryAutologin = async () => {
    try {
      const response = await autoLogin();
      setIsLoading(false);
      setIsAuthenticated(true);
      const newToken = response.data.accessToken;
      localStorage.setItem("accessToken", newToken);
      return;
    } catch (autoLoginError) {
      setIsLoading(false);
      setIsAuthenticated(false);
      localStorage.removeItem("accessToken");
      navigate("/");
      return Promise.reject(autoLoginError);
    }
  };

  const validateToken = async (token) => {
    try {
      await getCurrentUser(token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      setIsAuthenticated(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    navigate("/home");
    return null;
  }

  return (
    <div>
      <Link className={styles["goback-button"]} to={`/home`}>
        <p> ← Go Back</p>
      </Link>
      <div className={styles["container"]}>
        <h2 className={styles["header"]}>{book.title}</h2>
        <div className={styles["details"]}>
          <p className={styles["detail"]}>Genre: {book.genre}</p>
          <p className={styles["detail"]}>Author: {book.author}</p>
        </div>
      </div>
    </div>
  );
};

BookPage.propTypes = {
  book: PropTypes.shape({
    image: PropTypes.string,
    title: PropTypes.string.isRequired,
    genre: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
  }),
};

export default BookPage;

import { useEffect, useState, useRef } from "react";
const KEY = "a8026a07";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceTimeout = useRef();

  useEffect(() => {
    const controller = new AbortController();

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }

    debounceTimeout.current = setTimeout(() => {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      fetchMovies();
    }, 500); // 500ms debounce

    return () => {
      controller.abort();
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [query]);

  return { movies, isLoading, error };
}
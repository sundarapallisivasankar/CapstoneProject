function searchMovie() {
  const movieName = document.getElementById("movieInput").value;
  if (!movieName) return;

  fetch(`https://www.omdbapi.com/?apikey=219f97a0&t=${movieName}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.Response === "False") {
        document.getElementById("movieDetails").innerHTML = "<p>Movie not found.</p>";
        return;
      }

      const movieHTML = `
        <img src="${data.Poster}" alt="Poster" />
        <h2>${data.Title}</h2>
        <p><strong>Genre:</strong> ${data.Genre}</p>
        <p><strong>Cast:</strong> ${data.Actors}</p>
        <p><strong>Rating:</strong> ${data.imdbRating}</p>
        <p><strong>Released:</strong> ${data.Released}</p>
        <p><strong>Plot:</strong> ${data.Plot}</p>
        <p><a href="https://www.google.com/search?q=watch+${data.Title}+online" target="_blank">🔗 Watch/Download Online</a></p>
      `;
      document.getElementById("movieDetails").innerHTML = movieHTML;
    })
    .catch((err) => {
      console.error("Error fetching movie data:", err);
      document.getElementById("movieDetails").innerHTML = "<p>Error loading movie info.</p>";
    });
}

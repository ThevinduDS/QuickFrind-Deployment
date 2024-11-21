//Remove the token from the URL
document.addEventListener("DOMContentLoaded", () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState(null, '', url);
});

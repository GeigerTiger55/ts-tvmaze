import axios from "axios";
import * as $ from "jquery";
import { ids } from "webpack";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");

const BASE_URL = "https://api.tvmaze.com";
const DEFAULT_IMG = "https://tinyurl.com/tv-missing";

interface ShowInterface {
    id: number;
    name: string;
    summary: string;
    image: string;
}

interface ShowAPIInterface {
    score: number;
    show: {
        id: number;
        name: string;
        summary: string;
        image: { medium: string; } | null;
    };
}

interface EpisodeInterface {
    id: number;
    name: string;
    season: string;
    number: string;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowInterface[]> {
    const resp = await axios.get(
        `${BASE_URL}/search/shows?q=${term}`
    );
    const shows: ShowInterface[] = resp.data.map((s: ShowAPIInterface) => ({
        id: s.show.id,
        name: s.show.name,
        summary: s.show.summary,
        image: (s.show.image?.medium || DEFAULT_IMG)!,
    }));
    return shows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
    $showsList.empty();

    for (let show of shows) {
        const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
        );

        $showsList.append($show);
    }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
    const term = $("#searchForm-term").val() as string;
    const shows = await getShowsByTerm(term);

    $episodesArea.hide();
    populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
    evt.preventDefault();
    await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
    const resp = await axios.get(
        `${BASE_URL}/shows/${id}/episodes`
    );
    const episodes: EpisodeInterface[] = resp.data.map(
        (e: EpisodeInterface) => ({
            id: e.id,
            name: e.name,
            season: e.season,
            number: e.number,
        }));
    return episodes;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes: EpisodeInterface[]) {
    $episodesList.empty();

    for (let episode of episodes) {
        const $episode = $(
            `<li>
                <div data-episode-id="${episode.id}" class="Episode col-md-12 col-lg-6 mb-4">
                    <div class="media">
                        <div class="media-body">
                            <h5 class="text-primary">${episode.name}</h5>
                            <div><small>${episode.season}</small></div>
                        </div>
                    </div>
                </div>
            </li>
            `
        );
        $episodesList.append($episode);
    }
    $episodesArea.show();
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

 async function getEpisodesAndDisplay(evt: JQuery.ClickEvent): Promise<void> {
    const showId = $(evt.target).closest(".Show").data("show-id") as number;
    const episodes = await getEpisodesOfShow(showId);
    populateEpisodes(episodes);
}

//TODO: fix how to add event listener
const $episodeButtons = $(".Show-getEpisodes");
$episodeButtons.on("click", getEpisodesAndDisplay);
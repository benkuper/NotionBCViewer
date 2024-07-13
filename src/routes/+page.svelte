<script>
    import { onMount } from "svelte";
    import AutoComplete from "simple-svelte-autocomplete";
    import {
        databases,
        currentVolunteer,
        currentShow,
        currentPlace,
        getVolunteerByName,
        getShowByName,
        getPlaceByName,
        mode,
        urlName,
        urlShow,
        urlPlace,
        showPastQuests,
    } from "./store";
    import AffectationList from "./AffectationList.svelte";

    const dayNames = ["Mercredi", "Jeudi", "Vendredi", "Samedi"];

    $: volunteerChoices = $databases?.volunteers.pages.map((item) => {
        return {
            data: item,
            name: item.properties.Pseudo.title[0].plain_text,
            fullName:
                item.properties["Prénom"].rich_text[0].plain_text +
                " " +
                item.properties["Nom"].rich_text[0].plain_text,
        };
    });

    $: showsChoices = $databases?.shows.pages.map((item) => {
        return {
            data: item,
            name: item.properties.Nom.title[0].plain_text,
        };
    });

    $: placesChoices = $databases?.places.pages.map((item) => {
        return {
            data: item,
            name: item.properties.Name.title[0].plain_text,
        };
    });

    onMount(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        urlName.set(urlParams.get("nom"));
        urlShow.set(urlParams.get("show"));
        urlPlace.set(urlParams.get("place"));
    });

    $: {
        if ($databases) {
            if ($currentVolunteer == null && $urlName) {
                currentVolunteer.set(getVolunteerByName($urlName));
                mode.set("volunteer");
            } else if ($currentShow == null && $urlShow) {
                currentShow.set(getShowByName($urlShow));
                mode.set("show");
            } else if ($currentPlace == null && $urlPlace) {
                currentPlace.set(getPlaceByName($urlPlace));
                mode.set("place");
            }
        }
    }

    $: volunteerChoices?.sort((a, b) => {
        return a.name.localeCompare(b.name);
    });
</script>

{#if $databases}
    <div class="main">
        <div class="filters">
            <div class="volunteer-filter">
                <AutoComplete
                    html5autocomplete={false}
                    autocompleteOffValue="none"
                    showClear={true}
                    hideArrow={true}
                    className="autocomplete-filter"
                    dropdownClassName="autocomplete-dropdown"
                    placeholder="Nom du bénévole"
                    items={volunteerChoices}
                    valueFunction={(value) => {
                        mode.set("volunteer");
                        currentVolunteer.set(value?.data);
                    }}
                    labelFunction={(volunteer) =>
                        volunteer.name + " (" + volunteer.fullName + ")"}
                />
            </div>

            <div class="show-filter">
                <AutoComplete
                    html5autocomplete={false}
                    showClear={true}
                    hideArrow={true}
                    autocompleteOffValue="none"
                    className="autocomplete-filter"
                    dropdownClassName="autocomplete-dropdown"
                    placeholder="Nom du spectacle"
                    items={showsChoices}
                    valueFunction={(value) => {
                        mode.set("show");
                        currentShow.set(value?.data);
                    }}
                    labelFunction={(show) => show.name}
                />
            </div>

            <div class="place-filter">
                <AutoComplete
                    html5autocomplete={false}
                    showClear={true}
                    hideArrow={true}
                    autocompleteOffValue="none"
                    className="autocomplete-filter"
                    dropdownClassName="autocomplete-dropdown"
                    placeholder="Nom du lieu"
                    items={placesChoices}
                    valueFunction={(value) => {
                        mode.set("place");
                        currentPlace.set(value?.data);
                    }}
                    labelFunction={(place) => place.name}
                />
            </div>

            <div class="pastQuests">
                <input type="checkbox" bind:checked={$showPastQuests} />
                <label for="showPastQuests">Montrer les quêtes passées</label>
            </div>
        </div>

        {#key $showPastQuests}
        <div class="affectations-wrapper">
            <AffectationList />
        </div>
        {/key}
    </div>
{:else}
    <div class="loading">Chargement...</div>
{/if}


<style>
    .main {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        position: relative;
        box-sizing: border-box;
        flex-gap: 0;
    }


    .affectations-wrapper {
        flex: 1;
        overflow-y: auto;
        padding-top: 20px;
    }

    .loading
    {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }
</style>
<script>
    import { onMount } from "svelte";
    import AutoComplete from "simple-svelte-autocomplete";
    import { page } from "$app/stores";
    import {
        databases,
        currentVolunteer,
        currentShow,
        currentPlace,
        currentType,
        getVolunteerByName,
        getShowByName,
        getPlaceByName,
        mode,
        urlName,
        urlShow,
        urlPlace,
        urlType,
        showPastQuests,
        printMode,
        getTypeByName,
        getTypeByID,

        showPhone

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

    $: typesChoices = $databases?.questsTypes.pages.map((item) => {
        return {
            data: item,
            name: item.properties.Name.title[0].plain_text,
        };
    });

    $: 
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
            }else if($currentType == null && $urlType){
                currentType.set(getTypeByName($urlType));
                mode.set("type");

        }
    }

    $: volunteerChoices?.sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

    $: {
        urlName.set(null);
        urlShow.set(null);
        urlPlace.set(null);
        if ($databases) {
            $page.url.searchParams.forEach((value, key) => {
                if (key === "nom") {
                    urlName.set(value);
                    mode.set("volunteer");
                    currentVolunteer.set(getVolunteerByName(value));
                } else if (key === "show") {
                    urlShow.set(value);
                    mode.set("show");
                    currentShow.set(getShowByName(value));
                } else if (key === "place") {
                    urlPlace.set(value);
                    mode.set("place");
                    currentPlace.set(getPlaceByName(value));
                }else if(key == "type")
                {
                    urlType.set(value);
                    mode.set("type");
                    currentType.set(getTypeByName(value));
                }else if(key == "print")
                {
                    printMode.set(value);
                }else if(key == "showPhone")
                {
                    showPhone.set(value);
                }
            });
        }
    }

    // onMount(async () => {
    //     handleURLParams($page.url.searchParams);
    // });

    // function handleURLParams(searchParams) {
    //    urlName.set(searchParams.get("nom"));
    //     urlShow.set(searchParams.get("show"));
    //     urlPlace.set(searchParams.get("place"));
    // }
</script>

{#if $databases}
    <div class="main {$printMode?"print":""}">
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
                    placeholder="Lieu"
                    items={placesChoices}
                    valueFunction={(value) => {
                        mode.set("place");
                        currentPlace.set(value?.data);
                    }}
                    labelFunction={(place) => place.name}
                />
            </div>

            <div class="type-filter">
                <AutoComplete
                    html5autocomplete={false}
                    showClear={true}
                    hideArrow={true}
                    autocompleteOffValue="none"
                    className="autocomplete-filter"
                    dropdownClassName="autocomplete-dropdown"
                    placeholder="Type de quete"
                    items={typesChoices}
                    valueFunction={(value) => {
                        mode.set("type");
                        currentType.set(value?.data);
                    }}
                    labelFunction={(type) => type.name}
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

    .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }
</style>

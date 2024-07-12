<script>
    import { databases } from "$lib/db";
    import { onMount } from "svelte";
    import AutoComplete from "simple-svelte-autocomplete";

    $: volunteersDB = $databases?.volunteers;
    $: questsDB = $databases?.quests;
    $: showsDB = $databases?.shows;
    $: questsTypesDB = $databases?.questsTypes;
    $: affectationsDB = $databases?.affectations;

    let urlName = null;
    let urlVolunteer;

    onMount(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        urlName = urlParams.get("nom");
    });

   let currentVolunteer;

    $: 
    {
        if(currentVolunteer == null && urlName) {
            currentVolunteer = getVolunteerByName(urlName);
        }
    }

    $: volunteerChoices = volunteersDB?.pages.map((item) => {
        return {
            data: item,
            name: item.properties.Pseudo.title[0].plain_text,
            fullName:
                item.properties["Prénom"].rich_text[0].plain_text +
                " " +
                item.properties["Nom"].rich_text[0].plain_text,
        };
    });

    const dayNames = ["Mercredi", "Jeudi", "Vendredi", "Samedi"];

    $: volunteerChoices?.sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

    function getVolunteerByID(id) { 
        if (!volunteersDB) return null;
        return volunteersDB.pages.find((volunteer) => volunteer.id == id);
    }

    function getVolunteerByName(name) {
        if (!volunteersDB) return null;
        return volunteersDB.pages.find(
            (volunteer) => volunteer.properties.Pseudo.title[0].plain_text.replace(/\s/g, '').toLowerCase() == name.toLowerCase() ||
                volunteer.properties.Nom.rich_text[0].plain_text.trim() == name ||
                volunteer.properties["Prénom"].rich_text[0].plain_text == name
        );
    }

    function getVolunteerAffectations(volunteer) {
        if (!affectationsDB) return null;

        let dates = {};
        dayNames.forEach((dayName) => {
            dates[dayName] = [];
        });

        affectationsDB.pages.forEach((affectation) => {
            if (
                !affectation.properties["Bénévoles"].relation.some(
                    (person) => person.id == volunteer.id,
                )
            )
                return;

            const date = new Date(affectation.properties["Horaire"].date.start);
            let dayName = dayNames[date.getDate() - 13];
            if (dates[dayName]) dates[dayName].push(affectation);
        }, []);

        return dates;
    }

    function syntaxHighlight(json) {
        if (json == null) return;
        if (typeof json != "string") {
            json = JSON.stringify(json, undefined, 2);
        }
        json = json
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        return json.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            function (match) {
                var cls = "number";
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = "key";
                    } else {
                        cls = "string";
                    }
                } else if (/true|false/.test(match)) {
                    cls = "boolean";
                } else if (/null/.test(match)) {
                    cls = "null";
                }
                return '<span class="' + cls + '">' + match + "</span>";
            },
        );
    }

    function datePretty(date) {
        return new Date(date).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
</script>

{#if $databases}
    Bénévole : 
    <AutoComplete
        dropdownClassName="autocomplete-dropdown"
        items={volunteerChoices}
        bind:value={currentVolunteer}
        valueFieldName="data"
        labelFunction={(volunteer) =>
            volunteer.name + " (" + volunteer.fullName + ")"}
    />
    <div class="affectations">
        {#if currentVolunteer}
            <h2>
                Voila tes quêtes, {currentVolunteer.properties.Pseudo.title[0]
                    .plain_text} !
            </h2>

            <div class="dates">
                {#each Object.entries(getVolunteerAffectations(currentVolunteer)) as date}
                    <div class="date">
                        <p class="dayName">{date[0]}</p>
                        {#each date[1] as affectation}
                            <div class="affectation">
                                <span class="aff-name">
                                    {affectation.properties["Nom"].title[0]
                                        .plain_text}
                                </span>
                                <span class="aff-time">
                                    {datePretty(
                                        affectation.properties["Horaire"].date
                                            .start,
                                    )} à {datePretty(
                                        affectation.properties["Horaire"].date
                                            .end,
                                    )}
                                </span>

                                <p class="aff-lieu">
                                    {affectation.properties["Lieu"].formula.string}
                                </p>

                                <p class="aff-friends">Avec 
                                    {affectation.properties["Bénévoles"].relation
                                        .filter((volunteer)=> getVolunteerByID(volunteer.id) != currentVolunteer).map((volunteer) => {
                                            return getVolunteerByID(volunteer.id).properties.Pseudo.title[0].plain_text;
                                        })
                                        .join(", ")}
                                </p>
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
    <!-- <pre>{@html syntaxHighlight(affectationsDB)}</pre> -->
{/if}

<style>
    :global(body) {
        /* dark theme */
        background-color: #1e1e1e;
        color: #d4d4d4;
        font-family: Arial, sans-serif;
    }

    :global(input) {
        background-color: #2e2e2e;
        color: #d4d4d4;
        border: 1px solid #3e3e3e;
        border-radius: 5px;
        padding: 5px;
    }

    :global(.autocomplete-dropdown) {
        background-color: #2e2e2e !important;
        color: #d4d4d4 !important;
        border: 1px solid #3e3e3e;
        border-radius: 5px;
        padding: 5px;
    }

    :global(.autocomplete-dropdown .autocomplete-list-item) {
        padding: 5px;
        color: #d4d4d4 !important;
    }

    .affectations {
        display: flex;
        width: 100%;
        flex-direction: column;
        align-items: center;
    }

    .dates {
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
    }

    .date {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        align-items: center;
        margin: 10px;
        background-color: #2e2e2e;
        border-radius: 5px;
        padding: 0 10px 5px;
    }

    .affectation {
        width: 100%;
        margin: 5px;
        padding: 5px;
        background-color: #3e3e3e;
        border-radius: 5px;
    }

    .dayName {
        font-size: 1.5em;
        font-weight: bold;
        margin: 10px;
    }

    .aff-name {
        font-size: 1.2em;
        font-weight: bold;
    }

    .aff-time {
        font-size: 1em;
    }

    .aff-lieu {
        font-size: 1em;
    }


    pre {
        outline: 1px solid #ccc;
        padding: 5px;
        margin: 5px;
    }
    :global(pre .string) {
        color: green;
    }
    :global(pre .number) {
        color: darkorange;
    }
    :global(pre .boolean) {
        color: blue;
    }
    :global(pre .null) {
        color: magenta;
    }
    :global(pre .key) {
        color: red;
    }
</style>

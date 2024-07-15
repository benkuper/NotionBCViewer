<script>
    import {
        currentVolunteer,
        currentShow,
        currentPlace,
        datePretty,
        getAffectationIcon,
        getVolunteerAffectations,
        getShowAffectations,
        getPlaceAffectations,
        getVolunteerByID,
        mode,
    } from "./store";
    import { qr } from "@svelte-put/qr/svg";

    let item = null;
    let affectationFunction;
    let headerText;
    let qrData;
    let volunteerFilter;

    $: {
        if ($mode == "volunteer" && $currentVolunteer) {
            item = $currentVolunteer;
            affectationFunction = getVolunteerAffectations;
            headerText =
                "Voici tes quêtes, " +
                $currentVolunteer.properties.Pseudo.title[0].plain_text +
                " !";
            qrData =
                "https://benjamin.kuperberg.fr/bc2024/?nom=" +
                $currentVolunteer?.properties.Pseudo.title[0].plain_text;
            volunteerFilter = (volunteer) => volunteer.id != $currentVolunteer.id;
        } else if ($mode == "show" && $currentShow) {
            item = $currentShow;
            affectationFunction = getShowAffectations;
            headerText =
                "Les quêtes de \n" +
                $currentShow.properties.Nom.title[0].plain_text;
            qrData =
                "https://benjamin.kuperberg.fr/bc2024/?show=" +
                $currentShow.properties.Nom.title[0].plain_text;
            volunteerFilter = (volunteer) => true;
        } else if ($mode == "place" && $currentPlace) {
            item = $currentPlace;
            affectationFunction = getPlaceAffectations;
            headerText =
                "Les quêtes de <br/>" +
                $currentPlace.properties.Name.title[0].plain_text;
            qrData =
                "https://benjamin.kuperberg.fr/bc2024/?place=" +
                $currentPlace.properties.Name.title[0].plain_text;

            volunteerFilter = (volunteer) => true;
        }
    }
</script>

{#if item}
    <div class="affectations">
        <h2>
            {@html headerText}
        </h2>

        <div class="dates">
            {#each Object.entries(affectationFunction(item)) as date}
                <div class="date">
                    <p class="dayName">{date[0]}</p>
                    {#each date[1] as { affectation, isClosest, isPast, isOverlapping }}
                        <div
                            class="affectation {isClosest
                                ? 'next'
                                : ''} {isOverlapping ? 'overlap' : ''}
                                {isPast ? 'past' : ''}
                                "
                        >
                            <div class="aff-icon">
                                {getAffectationIcon(affectation)}
                            </div>
                            <p class="aff-name">
                                {affectation.properties["Nom"].title[0]
                                    .plain_text}
                            </p>

                            <div class="aff-infos">
                                <span class="aff-time">
                                    {datePretty(
                                        affectation.properties["Horaire"].date
                                            .start,
                                    )} à {datePretty(
                                        affectation.properties["Horaire"].date
                                            .end,
                                    )}
                                </span>
                                <span class="spacer"></span>
                                <span class="aff-lieu">
                                    {affectation.properties["Lieu"].formula
                                        .string}
                                </span>
                            </div>
                            <p class="aff-friends">
                                Avec
                                {affectation.properties["Bénévoles"].relation
                                    .filter(volunteerFilter)
                                    .map((volunteer) => {
                                        return getVolunteerByID(volunteer.id)
                                            .properties.Pseudo.title[0]
                                            .plain_text;
                                    })
                                    .join(", ")}
                            </p>
                        </div>
                    {/each}
                </div>
            {/each}
        </div>

        <div class="qr">
            <svg
                use:qr={{
                    data: qrData,
                    shape: "circle",
                }}
            />
        </div>
    </div>
{/if}

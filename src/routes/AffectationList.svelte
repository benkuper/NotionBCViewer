<script>
    import {
        currentVolunteer,
        currentShow,
        currentPlace,
        currentType,
        datePretty,
        getAffectationIcon,
        getVolunteerAffectations,
        getShowAffectations,
        getPlaceAffectations,
        getVolunteerByID,
        mode,
        getQuestByID,
        getShowByID,
        getPlaceByID,
        getQuestTypeByID,
        getTypeAffectations,
        getTypeByID,
        getTypeByName,
        printMode,

        showPhone

    } from "./store";
    import { qr } from "@svelte-put/qr/svg";
    import Modal from "./Modal.svelte";

    let item = null;
    let affectationFunction;
    let headerText;
    let qrData;
    let printLink;
    let volunteerFilter;
    let showShow;

    let popupQuestType = null;
    let showModal = false;

    let affectations = [];

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
            volunteerFilter = (volunteer) =>
                volunteer != null && $currentVolunteer != null && volunteer.id != $currentVolunteer.id;
            showShow = true;
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
            showShow = false;
        } else if ($mode == "place" && $currentPlace) {
            item = $currentPlace;
            affectationFunction = getPlaceAffectations;
            headerText =
                "Les quêtes du lieu : " +
                $currentPlace.properties.Name.title[0].plain_text;
            qrData =
                "https://benjamin.kuperberg.fr/bc2024/?place=" +
                $currentPlace.properties.Name.title[0].plain_text;

            volunteerFilter = (volunteer) => true;
            showShow = true;
        }else if( $mode == "type" && $currentType){
            item = $currentType;
            affectationFunction = getTypeAffectations;
            headerText = "Les quêtes de type : " + $currentType.properties.Name.title[0].plain_text;
            qrData = "https://benjamin.kuperberg.fr/bc2024/?type=" + $currentType.properties.Name.title[0].plain_text;
           
            volunteerFilter = (volunteer) => true;
            showShow = false;
        }

        printLink = qrData+"&print=true";

        if (affectationFunction) affectations = affectationFunction(item);
    }

    function getFriendsList(affectation) {
        let friends =
            affectation.properties["Bénévoles"].relation.filter(
                volunteerFilter,
            );

        if (friends == null || friends.length == 0) return "Tu es seul.e !";

        return (
            "Avec " +
            friends
                .map((volunteer) => {
                    let vName = getVolunteerByID(volunteer.id).properties.Pseudo
                        .title[0].plain_text;

                    let phone = $showPhone?getVolunteerByID(volunteer.id).properties["Phone"].phone_number:"";
                    if(phone) phone = " ("+phone+")";
                    else phone = "";

                    return (
                        '<a href="' +
                        window.location.href.split("?")[0] +
                        "?nom=" +
                        vName +
                        '">' +
                        vName +
                        " "+
                        phone+
                        "</a>"
                    );
                })
                .join(", ")
        );
    }

    function showQuestInfosPopup(affectation) {
        let quest = getQuestByID(
            affectation.properties["Quête"].relation[0].id,
        );
        console.log(quest);
        popupQuestType = getQuestTypeByID(
            quest.properties["Type de Quete"].relation[0].id,
        );

        showModal = true;
    }
</script>

{#if item && affectations}
    <div class="affectations {$mode}">
        <h2>
            {@html headerText} <a class="print-icon" target="_blank" href="{printLink}" style="text-decoration:none">🖨️</a>
        </h2>

        {#if $mode == "place"}
            {#if item.properties["Spectacles"]?.relation.length > 0}
                <p>Spectacles à ce lieu :</p>
                {#each item.properties["Spectacles"].relation as show, index}
                    <a
                        href="{window.location.href.split(
                            '?',
                        )[0]}?show={getShowByID(show.id).properties.Nom.title[0]
                            .plain_text}"
                    >
                        {getShowByID(show.id).properties.Nom.title[0]
                            .plain_text}
                    </a>
                {/each}
            {/if}
            
        {/if}

        {#if $mode == "show"}
            {#if item.properties["Lieux"]?.relation.length > 0}
                <span>
                    Lieu du spectacle :
                    {#each $currentShow.properties["Lieux"].relation as place, index}
                        <a
                            href="{window.location.href.split(
                                '?',
                            )[0]}?place={getPlaceByID(place.id).properties.Name
                                .title[0].plain_text}"
                        >
                            {getPlaceByID(place.id).properties.Name.title[0]
                                .plain_text}
                        </a>
                    {/each}
                </span>
            {/if}
        {/if}

        <div class="dates">
            {#each Object.entries(affectations) as date}
                <div class="date">
                    <p class="dayName">{date[0]}</p>

                    {#if date[1].length == 0}
                        <p class="no-affectation">
                            <iframe class="giphy-embed"
                                src="https://giphy.com/embed/NVUuyo5DYmBZLKMAvI"
                            />
                        </p>
                    {:else}
                        {#each date[1] as { affectation, isClosest, isPast, isOverlapping }}
                            <div
                                class="affectation {isClosest
                                    ? 'next'
                                    : ''} {isOverlapping ? 'overlap' : ''}
                                {isPast ? 'past' : ''}
                                "
                            >
                                <div class="aff-icon">
                                    <span
                                        on:click={() => {
                                            showQuestInfosPopup(affectation);
                                        }}
                                    >
                                        {getAffectationIcon(affectation)}
                                    </span>
                                </div>
                                <p class="aff-name">
                                    {affectation.properties["Nom"].title[0]
                                        .plain_text}
                                </p>

                                <div class="aff-infos">
                                    <span class="aff-time">
                                        {datePretty(
                                            affectation.properties["Horaire"]
                                                .date.start,
                                        )} à {datePretty(
                                            affectation.properties["Horaire"]
                                                .date.end,
                                        )}
                                    </span>
                                    <span class="spacer"></span>
                                    <span class="aff-lieu">
                                        <a
                                            href="{window.location.href.split(
                                                '?',
                                            )[0]}?place={affectation.properties[
                                                'Lieu'
                                            ].formula.string}"
                                        >
                                            {affectation.properties["Lieu"]
                                                .formula.string}
                                        </a>
                                    </span>
                                </div>

                                {#if showShow}
                                    <p class="aff-show">
                                        <a
                                            href="{window.location.href.split(
                                                '?',
                                            )[0]}?show={affectation.properties[
                                                'Spectacle'
                                            ].formula.string}"
                                        >
                                            {affectation.properties["Spectacle"]
                                                .formula.string}
                                        </a>
                                    </p>
                                {/if}
                                <p class="aff-friends">
                                    {@html getFriendsList(affectation)}
                                </p>
                            </div>
                        {/each}
                    {/if}
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

    {#if popupQuestType}
        <Modal bind:showModal>
            <h2 class="modal-header">
                {popupQuestType.icon.emoji}
                Quête : {popupQuestType.properties["Name"].title[0].plain_text}
            </h2>
            Fiche de poste :<br />
            {popupQuestType.properties["Fiche de poste"].rich_text[0]
                .plain_text}
        </Modal>
    {/if}
{/if}

<style>
    .modal-header {
        margin: 0px 0px 20px;
    }

    .giphy-embed
    {
        border:none;
    }
</style>

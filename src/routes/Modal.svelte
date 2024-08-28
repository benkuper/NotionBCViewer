<script>
    export let showModal; // boolean

    let dialog; // HTMLDialogElement

    $: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
    bind:this={dialog}
    on:close={() => (showModal = false)}
    on:click|self={() => dialog.close()}
>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
        <slot />
        <!-- svelte-ignore a11y-autofocus -->
        <div class="modal-footer">
            <button on:click={() => dialog.close()}>Fermer</button>
        </div>
    </div>
</dialog>

<style>
    dialog {
        max-width: 32em;
        border-radius: 0.3em;
        border: none;
        padding: 0;
        background-color: #ccc;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.3);
    }
    dialog > div {
        padding: 1em;
    }
    dialog[open] {
        animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes zoom {
        from {
            transform: scale(0.95);
        }
        to {
            transform: scale(1);
        }
    }
    dialog[open]::backdrop {
        animation: fade 0.2s ease-out;
    }
    @keyframes fade {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .modal-footer {
        margin-top: 20px;
        display: block;
        text-align: center;
    }
    
    .modal-footer button {
        padding: 10px 20px;
        background-color: #b70957;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
</style>

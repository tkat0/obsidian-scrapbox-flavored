<script lang="ts">
    export let value: string;
    export let ref: HTMLElement;
</script>

<input class="prompt-input" bind:value bind:this={ref} on:input on:change type="text" placeholder="" />

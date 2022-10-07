<script lang="ts">
  export let total: number;
</script>

<div class="absolute bottom-0 right-0 w-full flex">
  <div class="grow" />
  <div
    class="border-t-[1px] border-l-[1px] border-black border-text-accent-hover py-[2px] px-[4px] bg-background-primary"
  >
    {total} pages
  </div>
</div>

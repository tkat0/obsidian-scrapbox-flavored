<script lang="ts">
  export let total: number;
</script>

<div class="absolute bottom-0 right-0 flex w-full">
  <div class="grow" />
  <div
    class="border-text-accent-hover bg-background-primary border-t-[1px] border-l-[1px] border-black py-[2px] px-[4px]"
  >
    {total} pages
  </div>
</div>

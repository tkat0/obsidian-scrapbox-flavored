<script lang="ts">
  export let title: string;
  export let width: number;
</script>

<div class="bg-text-accent relative aspect-square" style="width: {width}px;">
  <div class="flex h-full w-full flex-col items-center justify-center whitespace-nowrap font-medium text-white">
    <div class="m-0 p-0">
      {title}
    </div>
  </div>
</div>

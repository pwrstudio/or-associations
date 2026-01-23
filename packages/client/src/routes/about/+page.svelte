<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<article>
	<h1>{data.about.title}</h1>

	{#if data.about.content}
		<div class="content">
			{#each data.about.content as block}
				{#if block._type === 'block'}
					<p>{block.children?.map((c: { text: string }) => c.text).join('')}</p>
				{/if}
			{/each}
		</div>
	{/if}
</article>

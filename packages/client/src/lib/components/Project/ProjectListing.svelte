<script lang="ts">
	import type { ExpandedProject } from '$lib/types';

	let { projects }: { projects: ExpandedProject[] } = $props();
</script>

<div class="project-listing">
	{#if projects && projects.length > 0}
		<ul>
			{#each projects as project}
				<li>
					<a href="/projects/{project.slug?.current}">
						{project.title}
						{#if project.category}
							<span class="category">({project.category})</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		No projects found
	{/if}
</div>

<style lang="scss">
	.project-listing {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		font-size: 2em;
		// text-align: center;
	}
</style>

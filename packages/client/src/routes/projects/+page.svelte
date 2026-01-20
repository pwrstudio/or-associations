<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<h1>Projects</h1>

{#if data.projects && data.projects.length > 0}
	<ul>
		{#each data.projects as project}
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
	<p>No projects found.</p>
{/if}

<style lang="scss">
	.category {
		opacity: 0.7;
	}
</style>

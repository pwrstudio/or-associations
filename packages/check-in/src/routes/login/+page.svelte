<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	let { form } = $props();

	let loading = $state(false);

	let isSignUp = $derived($page.url.searchParams.get('mode') === 'signup');
</script>

<div class="container">
	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}

	<form
		method="POST"
		action={isSignUp ? '?/signup' : '?/signin'}
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				await update();
			};
		}}
	>
		<input
			type="email"
			name="email"
			placeholder="Email"
			value={form?.email ?? ''}
			required
			disabled={loading}
			autocomplete="email"
		/>
		<input
			type="password"
			name="password"
			placeholder="Password"
			required
			disabled={loading}
			autocomplete={isSignUp ? 'new-password' : 'current-password'}
		/>
		{#if isSignUp}
			<input
				type="password"
				name="confirmPassword"
				placeholder="Confirm password"
				required
				disabled={loading}
				autocomplete="new-password"
			/>
		{/if}
		<button type="submit" disabled={loading}>
			{#if loading}
				{isSignUp ? 'Creating account...' : 'Signing in...'}
			{:else}
				{isSignUp ? 'Sign Up' : 'Sign In'}
			{/if}
		</button>
	</form>

	<p class="switch">
		{#if isSignUp}
			Already have an account? <a href="/login?mode=signin">Sign in</a>
		{:else}
			Don't have an account? <a href="/login?mode=signup">Sign up</a>
		{/if}
	</p>
</div>

<style lang="scss">
	.container {
		max-width: 400px;
		margin: 0 auto;
	}

	h1 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		font-weight: normal;
	}

	.intro {
		margin-bottom: 1.5rem;
		color: #666;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	input {
		padding: 1rem;
		font-size: 1rem;
		border: 2px solid #ccc;
		border-radius: 4px;

		&:focus {
			outline: none;
			border-color: #000;
		}
	}

	button {
		padding: 1rem 2rem;
		font-size: 1rem;
		border: 2px solid #000;
		background: #000;
		color: #fff;
		cursor: pointer;
		transition: all 0.2s;

		&:hover:not(:disabled) {
			background: #fff;
			color: #000;
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	.error {
		color: #c00;
		margin-bottom: 1rem;
	}

	.switch {
		margin-top: 1.5rem;
		font-size: 0.875rem;
		color: #666;
		text-align: center;

		a {
			color: #000;
			font-weight: 500;
		}
	}
</style>

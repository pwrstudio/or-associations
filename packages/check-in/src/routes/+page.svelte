<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let loading = $state(false);

	function formatDate(isoString: string): string {
		return new Date(isoString).toLocaleString();
	}
</script>

<div class="container">
	{#if !data.authenticated}
		<div class="auth-buttons">
			<a href="/login?mode=signin" class="button">Sign In</a>
			<a href="/login?mode=signup" class="button secondary">Sign Up</a>
		</div>
	{:else if form?.success}
		<div class="success">
			<p>Check in successfull</p>
			{#if form.location?.city || form.location?.country}
				<p class="location">
					{[form.location.city, form.location.country].filter(Boolean).join(', ')}
				</p>
			{/if}
			{#if form.location?.timezone}
				<p class="timezone">{form.location.timezone}</p>
			{/if}
			{#if form.checkedInAt}
				<p class="time">{formatDate(form.checkedInAt)}</p>
			{/if}
			<form method="POST" action="?/checkin" use:enhance>
				<button type="submit" class="checkin-button again">Check In Again</button>
			</form>
		</div>
	{:else}
		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}

		{#if data.lastCheckIn?.checkedInAt}
			<div class="last-checkin">
				<p class="label">Last check-in</p>
				<p class="time">{formatDate(data.lastCheckIn.checkedInAt)}</p>
				{#if data.lastCheckIn.city || data.lastCheckIn.country}
					<p class="location">
						{[data.lastCheckIn.city, data.lastCheckIn.country].filter(Boolean).join(', ')}
					</p>
				{/if}
				{#if data.lastCheckIn.timezone}
					<p class="timezone">{data.lastCheckIn.timezone}</p>
				{/if}
			</div>
		{/if}

		<form
			method="POST"
			action="?/checkin"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
		>
			<button type="submit" class="checkin-button" disabled={loading}>
				{#if loading}
					Checking in...
				{:else}
					CHECK IN
				{/if}
			</button>
		</form>
	{/if}
</div>

<style lang="scss">
	.container {
		max-width: 400px;
		margin: 0 auto;
	}

	.auth-buttons {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.button {
		display: block;
		padding: 1rem 2rem;
		font-size: 1rem;
		text-align: center;
		text-decoration: none;
		border: 2px solid #000;
		background: #000;
		color: #fff;
		transition: all 0.2s;
	}

	.button:hover {
		background: #fff;
		color: #000;
	}

	.button.secondary {
		background: #fff;
		color: #000;
	}

	.button.secondary:hover {
		background: #000;
		color: #fff;
	}

	.last-checkin {
		margin-bottom: 2rem;
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 4px;
	}

	.last-checkin .label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #666;
		margin: 0 0 0.5rem;
	}

	.last-checkin .time {
		font-size: 1rem;
		margin: 0 0 0.25rem;
	}

	.last-checkin .location {
		margin: 0 0 0.25rem;
	}

	.last-checkin .timezone {
		font-size: 0.875rem;
		color: #666;
		margin: 0;
	}

	.checkin-button {
		font-size: 1.5rem;
		padding: 2rem 4rem;
		border: 2px solid #000;
		background: #000;
		color: #fff;
		cursor: pointer;
		transition: all 0.2s;
		letter-spacing: 0.1em;
	}

	.checkin-button:hover:not(:disabled) {
		background: #fff;
		color: #000;
	}

	.checkin-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.checkin-button.again {
		font-size: 1rem;
		padding: 1rem 2rem;
		margin-top: 1rem;
	}

	.error {
		color: #c00;
		margin-bottom: 1rem;
	}

	.success {
		padding: 2rem;
		background: #e8f5e9;
		border-radius: 8px;
	}

	.success p {
		margin: 0 0 0.5rem;
	}

	.success .location {
		font-size: 1.25rem;
	}

	.success .timezone {
		font-size: 0.875rem;
		color: #666;
	}

	.success .time {
		font-size: 0.875rem;
		color: #666;
	}
</style>

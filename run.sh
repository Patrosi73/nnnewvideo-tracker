#!/bin/bash
while true; do
	deno run --allow-read --allow-run --allow-net main.ts
	sleep 30
done

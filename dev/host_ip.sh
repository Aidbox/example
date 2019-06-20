#!/bin/sh

export HOST_IP=$(ip route | awk '/default/ {print $3}')
echo $HOST_IP

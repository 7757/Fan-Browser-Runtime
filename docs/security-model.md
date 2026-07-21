# Security Model

Fan Browser Runtime treats browser automation as a privileged local capability.
The default runtime policy is intentionally narrow.

## Default Policy

- Allow `https:` and `http:` navigation.
- Reject `file:`, `javascript:`, `data:`, and other schemes.
- Reject localhost and private network hosts unless explicitly allowed.
- Do not expose downloads, file uploads, or clipboard writes in the MVP CLI.

## Agent Safety

Page-changing actions should be bound to an observation snapshot. If the current
snapshot does not match the action's `snapshotId`, the runtime rejects the
action.

## Future Policy Hooks

The public policy interface is expected to grow around these checkpoints:

- before navigation
- before request
- before action
- before download
- before clipboard write

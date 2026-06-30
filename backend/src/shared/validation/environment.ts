import { REQUIRED_ENVIRONMENT_VARIABLES } from '../constants/environment.js'
import { getRequiredEnv } from '../env/environment.js'

export function validateRequiredEnvironment(): void {
  for (const variableName of REQUIRED_ENVIRONMENT_VARIABLES) {
    getRequiredEnv(variableName)
  }
}

import { Pregunta } from '../models/Pregunta.js';
import { data } from "./data.js";

export const preguntas = data.map(p => new Pregunta(p.pregunta, p.opciones, p.correcta));
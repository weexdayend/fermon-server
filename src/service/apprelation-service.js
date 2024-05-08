import { db } from "../application/database.js";
import csv from "fast-csv";
import fs from "fs";
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
const execPromisified = promisify(exec);

import { createDomain } from 'domain';
import delay from 'delay';
const today = new Date();
const formattedDate = today.toISOString();

const create = async (request) => {
    return db.application_relation.create({
        data: {
            app_name: request.app_name,
            app_endpoint: request.app_endpoint,
            status_relation: request.status_relation,
        }
    });
}

const update = async (request) => {
    // const contact = validate(updateContactValidation, request);

    const totalContactInDatabase = await db.application_relation.count({
        where: {
            id: request.id
        }
    });

    if (totalContactInDatabase !== 1) {
        return res.status(404).json({ error: 'not found' });
    }

    await db.$transaction(async (tx) => {
        await tx.application_relation.update({
            where: {
                id: request.id
            },
            data: {
                app_name: request.app_name,
                app_endpoint: request.app_endpoint
            }
        })
    })

    return {message: 'Update successfully'}
}

const remove = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const totalInDatabase = await db.application_relation.count({
        where: {
            // username: user.username,
            id: id
        }
    });

    if (totalInDatabase !== 1) {
        // throw new ResponseError(404, "contact is not found");
        return res.status(404).json({ error: 'not found' });
    }

    return db.alokasi.delete({
        where: {
            id: id
        }
    });
}


export default {
    create,
    update,
    remove,
}

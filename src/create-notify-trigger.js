const createNotifyTrigger = async function ({client, table, key}) {
  try {
    const text = `
      CREATE OR REPLACE FUNCTION notify__${table}()
      RETURNS TRIGGER AS
      $body$
      DECLARE
      BEGIN
        IF (TG_OP = 'INSERT') THEN
          PERFORM pg_notify('watchers', 'table=' || TG_TABLE_NAME || 'when=' || TG_WHEN || '&newkey=' || NEW.${key});
        ELSE
          PERFORM pg_notify('watchers', 'table=' || TG_TABLE_NAME || 'when=' || TG_WHEN || '&newkey=' || NEW.${key} || '&oldkey=' || OLD.${key});
        END IF;
        RETURN NEW;
      END;
      $body$
      LANGUAGE plpgsql;
    `;

    const results = await client.query({text});

    return {
      client,
      results
    };
  } catch (error) {
    return {
      client,
      error
    };
  }
};

export default createNotifyTrigger;

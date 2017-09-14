const createNotifyFunction = async function ({client, key}) {
  try {
    const text = `
      CREATE OR REPLACE FUNCTION notify_trigger()
      RETURNS TRIGGER AS
      $body$
      DECLARE
      BEGIN
        IF (TG_OP = 'INSERT') THEN
          PERFORM pg_notify('watchers', 'table=' || TG_TABLE_NAME || '&when=' || TG_WHEN || '&newkey=' || NEW.${key});
          RETURN NEW;
        ELSIF (TG_OP = 'DELETE') THEN
          PERFORM pg_notify('watchers', 'table=' || TG_TABLE_NAME || '&when=' || TG_WHEN || '&oldkey=' || OLD.${key});
          RETURN OLD;
        ELSIF (TG_OP = 'UPDATE') THEN
          PERFORM pg_notify('watchers', 'table=' || TG_TABLE_NAME || '&when=' || TG_WHEN || '&newkey=' || NEW.${key} || '&oldkey=' || OLD.${key});
          RETURN NEW;
        END IF;
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
    throw error;
  }
};

export default createNotifyFunction;
